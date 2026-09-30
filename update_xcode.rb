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
