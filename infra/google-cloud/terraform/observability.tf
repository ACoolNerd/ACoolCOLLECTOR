locals {
  cloud_run_host = trimprefix(google_cloud_run_v2_service.api.uri, "https://")
}

resource "google_monitoring_uptime_check_config" "api_health" {
  display_name = "ACoolCOLLECTOR ${var.environment} API health"
  timeout      = "10s"
  period       = "60s"

  selected_regions = ["USA", "EUROPE", "ASIA_PACIFIC"]

  http_check {
    path         = "/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = local.cloud_run_host
    }
  }

  depends_on = [google_project_service.required, google_cloud_run_v2_service.api]
}

resource "google_monitoring_notification_channel" "email" {
  count        = var.alert_email == "" ? 0 : 1
  display_name = "ACoolCOLLECTOR ${var.environment} alerts"
  type         = "email"
  labels = {
    email_address = var.alert_email
  }
  force_delete = false
}

resource "google_monitoring_alert_policy" "uptime_failure" {
  display_name = "ACoolCOLLECTOR ${var.environment} uptime failure"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Health endpoint failed"
    condition_threshold {
      filter = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.label.check_id = \"${google_monitoring_uptime_check_config.api_health.uptime_check_id}\""
      duration        = "120s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = google_monitoring_notification_channel.email[*].name

  documentation {
    content   = "ACoolCOLLECTOR health checks are failing. Confirm Cloud Run status, inspect logs, and execute the documented rollback procedure when recovery is not immediate."
    mime_type = "text/markdown"
  }
}

resource "google_monitoring_alert_policy" "server_errors" {
  display_name = "ACoolCOLLECTOR ${var.environment} elevated server errors"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Cloud Run 5xx responses"
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.label.service_name = \"${google_cloud_run_v2_service.api.name}\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.label.response_code_class = \"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = google_monitoring_notification_channel.email[*].name

  documentation {
    content   = "The API is returning elevated 5xx responses. Review Cloud Logging, recent deployments, provider health, and database connectivity."
    mime_type = "text/markdown"
  }
}

resource "google_billing_budget" "monthly" {
  count           = var.billing_account_id == "" ? 0 : 1
  billing_account = var.billing_account_id
  display_name    = "ACoolCOLLECTOR ${var.environment} monthly budget"

  budget_filter {
    projects = ["projects/${data.google_project.current.number}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.monthly_budget_usd)
    }
  }

  threshold_rules {
    threshold_percent = 0.5
  }
  threshold_rules {
    threshold_percent = 0.9
  }
  threshold_rules {
    threshold_percent = 1.0
  }

  all_updates_rule {
    disable_default_iam_recipients = false
    monitoring_notification_channels = google_monitoring_notification_channel.email[*].name
  }
}
