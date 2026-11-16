# ==============================================================================
# Sim City Business - Importer 3D
# Compatible con SketchUp 2018 a 2026 (Ruby 2.2 a 3.2+)
# Construye Muros con Corte Arquitectónico, Pisos, Colisiones, Equipos y Personajes
# ==============================================================================

require 'json'

module SimCityBusiness
  module Importer
    # Crea o retorna una capa (tag) en el modelo activo
    def self.get_or_create_layer(model, layer_name)
      layer = model.layers[layer_name]
      unless layer
        layer = model.layers.add(layer_name)
      end
      layer
    end

    # Crea o retorna un material con color hexadecimal
    def self.get_or_create_material(model, name, hex_color)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        # Parse hex color
        hex = hex_color.to_s.gsub('#', '')
        if hex.length == 6
          r = hex[0..1].to_i(16)
          g = hex[2..3].to_i(16)
          b = hex[4..5].to_i(16)
          mat.color = Sketchup::Color.new(r, g, b)
        end
      end
      mat
    end

    # Crea un prisma ortogonal sólido 3D (caja) centrado en [cx, cy, cz] con dimensiones [w, h, d]
    # En SketchUp: X es Este/Oeste, Y es Norte/Sur (profundidad Three.js Z), Z es Altura (Three.js Y)
    def self.create_box_entity(entities, cx, cy, cz, w, h, d, material = nil, layer = nil)
      # Conversión de coordenadas Three.js (X, Y=alto, Z=fondo) a SketchUp (X, Y=fondo Three.js, Z=alto Three.js)
      # SketchUp usa pulgadas internamente; .m convierte metros a pulgadas.
      sk_x = cx.to_f.m
      sk_y = (-cz).to_f.m # invertir eje Z para orientación estándar de planta
      sk_z = (cy - h.to_f / 2.0).to_f.m

      half_w = (w.to_f / 2.0).m
      half_d = (d.to_f / 2.0).m
      height = h.to_f.m

      group = entities.add_group
      group.layer = layer if layer

      # 4 puntos de la cara base en el plano horizontal
      pts = [
        Geom::Point3d.new(sk_x - half_w, sk_y - half_d, sk_z),
        Geom::Point3d.new(sk_x + half_w, sk_y - half_d, sk_z),
        Geom::Point3d.new(sk_x + half_w, sk_y + half_d, sk_z),
        Geom::Point3d.new(sk_x - half_w, sk_y + half_d, sk_z)
      ]

      base_face = group.entities.add_face(pts)
      if base_face
        # Asegurar orientación hacia arriba
        base_face.reverse! if base_face.normal.z < 0
        base_face.pushpull(height)
      end

      group.material = material if material
      group
    end

    # Importa el archivo JSON / .scb completo
    def self.import_file(filepath)
      model = Sketchup.active_model
      model.start_operation('Importar Sim City Business', true)

      content = File.read(filepath)
      data = JSON.parse(content)

      # 1. Crear capas principales
      layer_muros = get_or_create_layer(model, 'SCB_Muros_Arquitectura')
      layer_corte = get_or_create_layer(model, 'SCB_Corte_Muros')
      layer_piso  = get_or_create_layer(model, 'SCB_Piso_Caminable')
      layer_col   = get_or_create_layer(model, 'SCB_Bloques_Colision')
      layer_eq    = get_or_create_layer(model, 'SCB_Equipos')
      layer_pers  = get_or_create_layer(model, 'SCB_Personajes')

      root_group = model.entities.add_group
      root_group.name = "SimCity_Consorcio_#{Time.now.strftime('%H%M%S')}"

      # 2. Importar Locales, Muros y Pisos
      locales = data['locales'] || []
      locales.each do |loc|
        loc_group = root_group.entities.add_group
        loc_group.name = "Local_#{loc['nombre'] || loc['id']}"

        # Pisos
        (loc['pisos'] || []).each do |p|
          c = p['centro'] || [0, 0, 0]
          mat = get_or_create_material(model, "Mat_Piso_#{loc['id']}", p['color'] || '#1e293b')
          box = create_box_entity(loc_group.entities, c[0], c[1], c[2], p['ancho'], p['espesor'] || 0.08, p['fondo'], mat, layer_piso)
          box.name = "Piso_#{p['tipo'] || 'Interior'}"
          box.set_attribute('SCB_DATA', 'negocioId', loc['id'])
          box.set_attribute('SCB_DATA', 'tipo', 'PISO')
        end

        # Muros
        (loc['muros'] || []).each do |m|
          c = m['centro'] || [0, 0, 0]
          d = m['dimensiones'] || [1, 1, 1]
          is_corte = (m['layer'] == 'SCB_Corte_Muros')
          layer = is_corte ? layer_corte : layer_muros
          mat = get_or_create_material(model, "Mat_Muro_#{loc['id']}", m['color'] || '#334155')
          box = create_box_entity(loc_group.entities, c[0], c[1], c[2], d[0], d[1], d[2], mat, layer)
          box.name = "Muro_#{m['lado'] || 'Perimetral'}"
          box.set_attribute('SCB_DATA', 'negocioId', loc['id'])
          box.set_attribute('SCB_DATA', 'tipo', 'MURO')
          box.set_attribute('SCB_DATA', 'lado', m['lado'].to_s)
        end
      end

      # 3. Importar Bloques de Colisión
      bloques = data['bloquesColision'] || []
      col_main_group = root_group.entities.add_group
      col_main_group.name = 'SCB_Bloques_Colision_Grupo'
      col_main_group.layer = layer_col

      bloques.each do |b|
        c = b['centro'] || [0, 0, 0]
        d = b['dimensiones'] || [1.2, 1.0, 1.2]
        mat = get_or_create_material(model, "Mat_Col_#{b['tagType'] || 'Block'}", b['color'] || '#ef4444')
        box = create_box_entity(col_main_group.entities, c[0], c[1], c[2], d[0], d[1], d[2], mat, layer_col)
        box.name = b['label'] || b['id'] || 'Colision'
        box.set_attribute('SCB_DATA', 'id', b['id'].to_s)
        box.set_attribute('SCB_DATA', 'negocioId', b['negocioId'].to_s)
        box.set_attribute('SCB_DATA', 'tagType', (b['tagType'] || 'COLLISION_BLOCK').to_s)
        box.set_attribute('SCB_DATA', 'tipo', 'COLLISION')
      end

      # 4. Importar Equipos y Mobiliario
      equipos = data['equipos'] || []
      eq_main_group = root_group.entities.add_group
      eq_main_group.name = 'SCB_Equipos_Grupo'
      eq_main_group.layer = layer_eq

      equipos.each do |eq|
        c = eq['centro'] || [0, 0, 0]
        d = eq['dimensiones'] || [1, 1, 1]
        mat = get_or_create_material(model, "Mat_Eq_#{eq['id']}", eq['color'] || '#475569')
        box = create_box_entity(eq_main_group.entities, c[0], c[1], c[2], d[0], d[1], d[2], mat, layer_eq)
        box.name = eq['nombre'] || eq['id'] || 'Equipo'
        box.set_attribute('SCB_DATA', 'id', eq['id'].to_s)
        box.set_attribute('SCB_DATA', 'negocioId', eq['negocioId'].to_s)
        box.set_attribute('SCB_DATA', 'tipo', 'EQUIPO')
      end

      # 5. Importar Personajes con Malla 3D y Ropa
      personajes = data['personajes'] || []
      pers_main_group = root_group.entities.add_group
      pers_main_group.name = 'SCB_Personajes_Grupo'
      pers_main_group.layer = layer_pers

      personajes.each do |p|
        p_group = pers_main_group.entities.add_group
        p_group.name = "#{p['nombre'] || p['id']} (#{p['rol'] || 'Sim'})"
        p_group.layer = layer_pers

        malla = p['malla3D'] || {}
        partes = malla['partes'] || []

        partes.each do |part|
          c = part['centro'] || [0, 0, 0]
          d = part['dimensiones'] || [0.3, 0.5, 0.3]
          mat = get_or_create_material(model, "Mat_Pers_#{p['id']}_#{part['nombre']}", part['color'] || '#facc15')
          sub_box = create_box_entity(p_group.entities, c[0], c[1], c[2], d[0], d[1], d[2], mat, layer_pers)
          sub_box.name = part['nombre'] || 'Parte'
        end

        p_group.set_attribute('SCB_DATA', 'id', p['id'].to_s)
        p_group.set_attribute('SCB_DATA', 'rol', p['rol'].to_s)
        p_group.set_attribute('SCB_DATA', 'tipo', 'PERSONAJE')
      end

      model.commit_operation
      UI.messagebox("¡Escena de Sim City Business importada exitosamente en SketchUp!\n\n" \
                    "- Locales: #{locales.length}\n" \
                    "- Bloques de Colisión: #{bloques.length}\n" \
                    "- Equipos: #{equipos.length}\n" \
                    "- Personajes: #{personajes.length}\n" \
                    "- Capas / Tags organizadas con prefijo 'SCB_'")
    end
  end
end
