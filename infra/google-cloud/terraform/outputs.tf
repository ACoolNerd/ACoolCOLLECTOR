output "cloud_run_service_name" {
  value = google_cloud_run_v2_service.api.name
}

output "cloud_run_uri" {
  value = google_cloud_run_v2_service.api.uri
}

output "runtime_service_account" {
  value = google_service_account.runtime.email
}

output "artifact_repository" {
  value = google_artifact_registry_repository.containers.id
}

output "private_media_bucket" {
  value = google_storage_bucket.private_media.name
}

output "public_assets_bucket" {
  value = google_storage_bucket.public_assets.name
}
