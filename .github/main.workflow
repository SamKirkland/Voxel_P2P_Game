workflow "Deploy Game" {
  resolves = ["FTP Deploy Action"]
  on = "push"
}

action "FTP Deploy Action" {
  uses = "SamKirkland/FTP-Deploy-Action@1.0.0"
  secrets = ["FTP_USERNAME", "FTP_PASSWORD", "FTP_SERVER"]
}
