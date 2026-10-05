require 'xcodeproj'
project_path = 'ios/GigPay.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'GigPay' }

group = project.main_group.find_subpath('GigPay', true)
file_ref = group.files.find { |f| f.path == '../.env' || f.name == '.env' }

if file_ref.nil?
  file_ref = group.new_file('../.env')
end

if !target.resources_build_phase.files_references.include?(file_ref)
  target.resources_build_phase.add_file_reference(file_ref)
  project.save
  puts "Successfully added .env to Copy Bundle Resources"
else
  puts ".env is already in Copy Bundle Resources"
end

# 1. Ensure .env exists in ios/ directory as well
require 'fileutils'
if File.exist?('.env')
  FileUtils.cp('.env', 'ios/.env')
  puts "Copied .env to ios/.env"
end

# 2. Pre-generate GeneratedDotEnv.m for react-native-config
rnc_path = 'node_modules/react-native-config/ios/ReactNativeConfig'
if Dir.exist?(rnc_path) && File.exist?("#{rnc_path}/ReadDotEnv.rb")
  require_relative "#{rnc_path}/ReadDotEnv"
  dotenv, _ = read_dot_env('.')
  puts "Read #{dotenv.keys.count} environment variables from .env"
  dotenv_objc = dotenv.map { |k, v| %(@"#{k}":@"#{v.to_s.chomp.gsub('"', '\"')}") }.join(',')
  template = "#define DOT_ENV @{ #{dotenv_objc} };\n"
  File.write("#{rnc_path}/GeneratedDotEnv.m", template)
  puts "Successfully pre-generated #{rnc_path}/GeneratedDotEnv.m"
end
