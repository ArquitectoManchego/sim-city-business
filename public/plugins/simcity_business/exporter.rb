# ==============================================================================
# Sim City Business - Exporter 3D
# Compatible con SketchUp 2018 a 2026 (Ruby 2.2 a 3.2+)
# Extrae Colisiones, NavMesh, Muros y Equipos modificados por el usuario
# ==============================================================================

require 'json'

module SimCityBusiness
  module Exporter
    # Recorre recursivamente un conjunto de entidades buscando objetos con atributos o capas de SCB
    def self.collect_scb_entities(entities, results)
      entities.each do |e|
        if e.is_a?(Sketchup::Group) || e.is_a?(Sketchup::ComponentInstance)
          layer_name = e.layer ? e.layer.name : ''
          tipo = e.get_attribute('SCB_DATA', 'tipo')

          # 1. Bloques de Colisión
          if layer_name == 'SCB_Bloques_Colision' || tipo == 'COLLISION'
            bb = e.bounds
            # Convertir coordenadas internas de SketchUp (pulgadas) a metros Three.js
            # SketchUp: X = X, Y = -Z_three, Z = Y_three
            w = bb.width.to_m
            d = bb.height.to_m
            h = bb.depth.to_m
            cx = bb.center.x.to_m
            cy = (bb.min.z + h / 2.0.m).to_m
            cz = -bb.center.y.to_m # Inversión de eje para coordinar con Three.js

            neg_id = e.get_attribute('SCB_DATA', 'negocioId') || 'hawaiian_paradise'
            block_id = e.get_attribute('SCB_DATA', 'id') || "col_skp_#{Time.now.to_i}_#{rand(1000)}"
            label = e.name && !e.name.empty? ? e.name : 'Bloque Editado en SketchUp'
            tag_type = e.get_attribute('SCB_DATA', 'tagType') || 'COLLISION_BLOCK'

            results[:colisiones] << {
              'id' => block_id,
              'negocioId' => neg_id,
              'label' => label,
              'tagType' => tag_type,
              'centro' => [cx.round(3), cy.round(3), cz.round(3)],
              'dimensiones' => [w.round(3), h.round(3), d.round(3)],
              'color' => '#ef4444'
            }
          end

          # 2. Piso Caminable / NavMesh
          if layer_name == 'SCB_Piso_Caminable' || tipo == 'PISO'
            bb = e.bounds
            results[:pisos] << {
              'nombre' => e.name,
              'centro' => [bb.center.x.to_m.round(3), bb.center.z.to_m.round(3), (-bb.center.y.to_m).round(3)],
              'dimensiones' => [bb.width.to_m.round(3), bb.depth.to_m.round(3), bb.height.to_m.round(3)]
            }
          end

          # Explorar subgrupos
          collect_scb_entities(e.definition.entities, results) if e.is_a?(Sketchup::ComponentInstance)
          collect_scb_entities(e.entities, results) if e.is_a?(Sketchup::Group)
        end
      end
    end

    # Construye el paquete de exportación desde el modelo activo
    def self.export_model_to_hash
      model = Sketchup.active_model
      results = { colisiones: [], pisos: [] }

      collect_scb_entities(model.entities, results)

      payload = {
        'formato' => 'SIM_CITY_BUSINESS_SKP_EXCHANGE',
        'version' => '2.0.0',
        'exportadoDesde' => 'Trimble SketchUp',
        'sketchupVersion' => Sketchup.version,
        'fecha' => Time.now.to_s,
        'unidades' => 'metros',
        'bloquesColision' => results[:colisiones],
        'pisoCaminable' => results[:pisos]
      }
      payload
    end

    # Guarda el archivo exportado en disco
    def self.save_export_file(default_filename = 'simcity_exported_from_sketchup.scb')
      payload = export_model_to_hash
      json_str = JSON.pretty_generate(payload)

      path = UI.savepanel('Exportar a Sim City Business', '', default_filename)
      if path
        path += '.scb' unless path.end_with?('.scb') || path.end_with?('.json')
        File.write(path, json_str)
        UI.messagebox("¡Exportación completada con éxito!\n\n" \
                      "Archivo guardado: #{path}\n" \
                      "Bloques de colisión exportados: #{payload['bloquesColision'].length}\n" \
                      "Pisos caminables exportados: #{payload['pisoCaminable'].length}\n\n" \
                      "Ahora puedes importar este archivo en la web app de Sim City Business o arrastrarlo.")
        path
      else
        nil
      end
    end
  end
end
