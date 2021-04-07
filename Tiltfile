docker_build('chaos-labs-app', '.',
  # build_args={'node_env': 'development'},
  # entrypoint='npm run nodemon /app/index.js',
  live_update=[
    sync('.', '/app'),
    run('cd /app && npm install', trigger=['./package.json', './package-lock.json']),
  ]
)

docker_compose('./docker-compose.yml')
