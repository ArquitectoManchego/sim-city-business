# ==============================================================================
# Sim City Business - Main Entry Point & Toolbar
# Compatible con SketchUp 2018 a 2026 (Ruby 2.2 a 3.2+)
# ==============================================================================

require 'sketchup.rb'
require_relative 'importer'
require_relative 'exporter'
require_relative 'sync_client'

module SimCityBusiness
  unless file_loaded?(__FILE__)
    # 1. Crear Toolbar
    toolbar = UI::Toolbar.new('Sim City Business')

    # Comando 1: Importar Escena
    cmd_import = UI::Command.new('Importar Escena Sim City') {
      path = UI.openpanel('Seleccionar Escena Sim City (.scb / .json)', '', 'Archivos Sim City (*.scb;*.json)|*.scb;*.json|Todos los archivos (*.*)|*.*||')
      if path && File.exist?(path)
        Importer.import_file(path)
      end
    }
    cmd_import.tooltip = 'Importar modelo 3D, locales, muros, colisiones y personajes desde Sim City'
    cmd_import.status_bar_text = 'Carga el archivo exportado de Sim City Business en SketchUp'
    cmd_import.small_icon = File.join(File.dirname(__FILE__), 'icons', 'import_16.png')
    cmd_import.large_icon = File.join(File.dirname(__FILE__), 'icons', 'import_32.png')
    toolbar.add_item(cmd_import)

    # Comando 2: Marcar como Bloque de Colisión
    cmd_col = UI::Command.new('Marcar como Colisión') {
      model = Sketchup.active_model
      sel = model.selection
      if sel.empty?
        UI.messagebox('Selecciona uno o más grupos para marcarlos como bloques de colisión.')
      else
        layer_col = Importer.get_or_create_layer(model, 'SCB_Bloques_Colision')
        model.start_operation('Marcar Colisión Sim City', true)
        sel.each do |e|
          if e.is_a?(Sketchup::Group) || e.is_a?(Sketchup::ComponentInstance)
            e.layer = layer_col
            e.set_attribute('SCB_DATA', 'tipo', 'COLLISION')
            e.set_attribute('SCB_DATA', 'tagType', 'COLLISION_BLOCK')
            e.name = 'Bloque_Colision_Editado' if !e.name || e.name.empty?
          end
        end
        model.commit_operation
        UI.messagebox("Se marcaron #{sel.length} elemento(s) como Bloques de Colisión (capa SCB_Bloques_Colision).")
      end
    }
    cmd_col.tooltip = 'Convierte la selección en un Bloque de Colisión para el simulador'
    cmd_col.status_bar_text = 'Asigna la capa SCB_Bloques_Colision y atributos semánticos'
    cmd_col.small_icon = File.join(File.dirname(__FILE__), 'icons', 'collision_16.png')
    cmd_col.large_icon = File.join(File.dirname(__FILE__), 'icons', 'collision_32.png')
    toolbar.add_item(cmd_col)

    # Comando 3: Marcar como Piso Caminable (NavMesh)
    cmd_piso = UI::Command.new('Marcar como Piso Caminable') {
      model = Sketchup.active_model
      sel = model.selection
      if sel.empty?
        UI.messagebox('Selecciona uno o más grupos o caras para marcarlos como piso caminable.')
      else
        layer_piso = Importer.get_or_create_layer(model, 'SCB_Piso_Caminable')
        model.start_operation('Marcar Piso Caminable', true)
        sel.each do |e|
          e.layer = layer_piso if e.respond_to?(:layer=)
          if e.is_a?(Sketchup::Group) || e.is_a?(Sketchup::ComponentInstance)
            e.set_attribute('SCB_DATA', 'tipo', 'PISO')
          end
        end
        model.commit_operation
        UI.messagebox("Se marcaron #{sel.length} elemento(s) como Piso Caminable (capa SCB_Piso_Caminable).")
      end
    }
    cmd_piso.tooltip = 'Convierte la selección en piso caminable / NavMesh'
    cmd_piso.status_bar_text = 'Asigna la capa SCB_Piso_Caminable a la selección'
    cmd_piso.small_icon = File.join(File.dirname(__FILE__), 'icons', 'navmesh_16.png')
    cmd_piso.large_icon = File.join(File.dirname(__FILE__), 'icons', 'navmesh_32.png')
    toolbar.add_item(cmd_piso)

    # Comando 4: Alternar Corte Arquitectónico (visibilidad de capa corte vs completa)
    cmd_corte = UI::Command.new('Alternar Corte Arquitectónico') {
      model = Sketchup.active_model
      layer_corte = model.layers['SCB_Corte_Muros']
      layer_muros = model.layers['SCB_Muros_Arquitectura']

      if layer_corte && layer_muros
        model.start_operation('Alternar Corte Muros', true)
        # Si corte está visible, cambiar a muros completos
        if layer_corte.visible?
          layer_corte.visible = false
          layer_muros.visible = true
          UI.messagebox('Corte arquitectónico APAGADO: Muros completos visibles (3.20m).')
        else
          layer_corte.visible = true
          layer_muros.visible = false
          UI.messagebox('Corte arquitectónico ENCENDIDO: Muros seccionados a 1.20m para visualización de planta.')
        end
        model.commit_operation
      else
        UI.messagebox('Primero importa una escena de Sim City Business para alternar las capas de corte arquitectónico.')
      end
    }
    cmd_corte.tooltip = 'Alterna entre corte arquitectónico (1.20m) y muros completos (3.20m)'
    cmd_corte.status_bar_text = 'Alterna la visibilidad entre SCB_Corte_Muros y SCB_Muros_Arquitectura'
    cmd_corte.small_icon = File.join(File.dirname(__FILE__), 'icons', 'corte_16.png')
    cmd_corte.large_icon = File.join(File.dirname(__FILE__), 'icons', 'corte_32.png')
    toolbar.add_item(cmd_corte)

    # Comando 5: Exportar a Archivo (.scb)
    cmd_export_file = UI::Command.new('Exportar a Archivo (.scb)') {
      Exporter.save_export_file
    }
    cmd_export_file.tooltip = 'Guarda un archivo .scb con colisiones y navmesh listos para la app'
    cmd_export_file.status_bar_text = 'Genera un archivo de intercambio Sim City Business'
    cmd_export_file.small_icon = File.join(File.dirname(__FILE__), 'icons', 'export_16.png')
    cmd_export_file.large_icon = File.join(File.dirname(__FILE__), 'icons', 'export_32.png')
    toolbar.add_item(cmd_export_file)

    # Comando 6: Sincronizar en Vivo Directamente con el Proyecto
    cmd_sync = UI::Command.new('Exportar Directamente a la App (Sync en Vivo)') {
      payload = Exporter.export_model_to_hash
      SyncClient.send_live_sync(payload)
    }
    cmd_sync.tooltip = 'Transmite los cambios en tiempo real a la Web App de Sim City'
    cmd_sync.status_bar_text = 'Envía colisiones y navmesh por HTTP local al simulador'
    cmd_sync.small_icon = File.join(File.dirname(__FILE__), 'icons', 'sync_16.png')
    cmd_sync.large_icon = File.join(File.dirname(__FILE__), 'icons', 'sync_32.png')
    toolbar.add_item(cmd_sync)

    toolbar.show

    # 2. Agregar Menú en Extensiones
    menu = UI.menu('Plugins') || UI.menu('Extensions')
    if menu
      scb_menu = menu.add_submenu('Sim City Business 3D')
      scb_menu.add_item(cmd_import)
      scb_menu.add_item(cmd_col)
      scb_menu.add_item(cmd_piso)
      scb_menu.add_item(cmd_corte)
      scb_menu.add_separator
      scb_menu.add_item(cmd_export_file)
      scb_menu.add_item(cmd_sync)
    end

    file_loaded?(__FILE__)
  end
end
