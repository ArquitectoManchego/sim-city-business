# ==============================================================================
# Sim City Business - Trimble SketchUp Extension Loader
# Compatible con versiones de SketchUp desde 2018 hasta 2026 (Ruby 2.2 a Ruby 3.2+)
# ==============================================================================

require 'sketchup.rb'
require 'extensions.rb'

module SimCityBusiness
  PLUGIN_ID = 'simcity_business'
  PLUGIN_NAME = 'Sim City Business 3D Bridge'
  PLUGIN_VERSION = '2.0.0'

  unless file_loaded?(__FILE__)
    ext = SketchupExtension.new(PLUGIN_NAME, File.join(File.dirname(__FILE__), PLUGIN_ID, 'main.rb'))
    ext.description = 'Exportador e importador 3D bidireccional entre Trimble SketchUp y Sim City Business (Muros, Colisiones, NavMesh, Equipos y Personajes).'
    ext.version     = PLUGIN_VERSION
    ext.copyright   = '2026 Sim City Business'
    ext.creator     = 'Sim City Business Architecture Team'

    Sketchup.register_extension(ext, true)
    file_loaded?(__FILE__)
  end
end
