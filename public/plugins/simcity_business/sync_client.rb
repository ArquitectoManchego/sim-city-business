# ==============================================================================
# Sim City Business - HTTP Live Sync Client
# Compatible con SketchUp 2018 a 2026 (Ruby 2.2 a 3.2+)
# Envía los datos directamente al servidor Vite local (puerto 3040 / 5173)
# ==============================================================================

require 'net/http'
require 'uri'
require 'json'

module SimCityBusiness
  module SyncClient
    ENDPOINTS = [
      'http://localhost:3040/api/sketchup-sync',
      'http://127.0.0.1:3040/api/sketchup-sync',
      'http://localhost:5173/api/sketchup-sync',
      'http://127.0.0.1:5173/api/sketchup-sync'
    ]

    def self.send_live_sync(payload_hash)
      json_body = JSON.generate(payload_hash)
      success = false
      connected_url = nil

      ENDPOINTS.each do |url_str|
        begin
          uri = URI.parse(url_str)
          http = Net::HTTP.new(uri.host, uri.port)
          http.open_timeout = 1.5
          http.read_timeout = 2.5

          request = Net::HTTP::Post.new(uri.request_uri)
          request['Content-Type'] = 'application/json'
          request.body = json_body

          response = http.request(request)
          if response.code.to_i >= 200 && response.code.to_i < 300
            success = true
            connected_url = url_str
            break
          end
        rescue => e
          # Probar siguiente endpoint
        end
      end

      if success
        UI.messagebox("⚡ ¡Sincronización en Vivo Exitosa!\n\n" \
                      "Tus cambios de SketchUp se enviaron directamente a la App Web en:\n#{connected_url}\n\n" \
                      "Bloques de colisión: #{payload_hash['bloquesColision'].length}\n" \
                      "Pisos/NavMesh: #{payload_hash['pisoCaminable'].length}\n" \
                      "La escena se ha actualizado en tiempo real sin recargar.")
        true
      else
        # Si el servidor local no responde, ofrecer guardar como archivo
        result = UI.messagebox("El servidor local de Sim City Business (puerto 3040/5173) no respondió.\n\n" \
                               "¿Deseas guardar los cambios en un archivo .scb para importarlo manualmente en la web app?", MB_YESNO)
        if result == IDYES
          Exporter.save_export_file
        end
        false
      end
    end
  end
end
