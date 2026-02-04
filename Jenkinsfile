pipeline {
  agent any

  tools { nodejs 'node-20' }

  environment {
    BASE_URL="http://127.0.0.1"
    PORT = '8080'
    MYSQL_ROOT_PASSWORD = 'rootpw'
    MYSQL_DATABASE = 'todo_db'
    MYSQL_USER = 'abhyas_user'
    MYSQL_PASSWORD = 'abhyas_password'
    DB_HOST = 'db'
    DB_PORT = '3306'
    DB_USER = 'abhyas_user'
    DB_PASSWORD = 'abhyas_password'
    DB_NAME = 'todo_db'
  }

  stages {
    stage('Prepare Version') {
      steps {
        sh '''
          set -eu
          mkdir -p artifacts

          BASE_VERSION=$(node -p "require('./backend/package.json').version")
          GIT_SHA=$(git rev-parse --short HEAD)
          BRANCH_SAFE=$(echo "${BRANCH_NAME:-unknown}" | tr '/' '-')

          VERSION="${BASE_VERSION}+build.${BUILD_NUMBER}.${GIT_SHA}"
          DOCKER_TAG="${VERSION//+/-}"

          echo "${VERSION}" | tee artifacts/VERSION.txt

          {
            echo "VERSION=${VERSION}"
            echo "DOCKER_TAG=${DOCKER_TAG}"
            echo "BRANCH_SAFE=${BRANCH_SAFE}"
          } > artifacts/version.env
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          withSonarQubeEnv('sq1') {
            sh """
              set -eu
              ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=cd-pipeline-ts-express-backend \
                -Dsonar.projectName=cd-pipeline-ts-express-backend \
                -Dsonar.sources=backend/src \
                -Dsonar.exclusions=**/node_modules/**,**/dist/** \
                -Dsonar.sourceEncoding=UTF-8
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build Images') {
      steps {
        sh '''
          set -eu
          source artifacts/version.env

          docker build -t "todo-web:${DOCKER_TAG}" ./backend
          docker build -t "todo-nginx:${DOCKER_TAG}" ./nginx
        '''
      }
    }

    stage('E2E Tests') {
      steps {
        sh '''
          set -eu
          source artifacts/version.env

          docker compose up -d --build

          for i in $(seq 1 30); do
            if curl -fsS "http://127.0.0.1/api/v1/public/health" >/dev/null; then
              echo "Staging is healthy"
              break
            fi

            echo "Waiting for staging health... ($i/30)"
            sleep 2
          done

          curl -fsS "http://127.0.0.1/api/v1/public/health" >/dev/null

          npm ci

          npm run e2e

          tar -czf "artifacts/playwright-report-${BRANCH_SAFE}-${DOCKER_TAG}.tgz" playwright-report

          ls -lh artifacts
        '''
      }
      post {
        always {
          sh 'docker compose down -v --remove-orphans || true'
        }
      }
    }

    stage('Package Artifacts') {
      steps {
        sh '''
          set -eu
          source artifacts/version.env

          docker save "todo-web:${DOCKER_TAG}" | gzip > "artifacts/todo-web-${BRANCH_SAFE}-${DOCKER_TAG}.tar.gz"
          docker save "todo-nginx:${DOCKER_TAG}" | gzip > "artifacts/todo-nginx-${BRANCH_SAFE}-${DOCKER_TAG}.tar.gz"

          ls -lh artifacts
        '''
      }
    }
    
    stage('Package Deployment Bundle') {
      steps {
        sh '''
          set -eu
          source artifacts/version.env

          mkdir -p artifacts/deploy

          cp docker-compose.yml artifacts/deploy/
          cp .env.example artifacts/deploy/ || true
          cp -r db artifacts/deploy/

          cp "artifacts/todo-web-${BRANCH_SAFE}-${DOCKER_TAG}.tar.gz" artifacts/deploy/
          cp "artifacts/todo-nginx-${BRANCH_SAFE}-${DOCKER_TAG}.tar.gz" artifacts/deploy/

          tar -czf "artifacts/deploy-bundle-${BRANCH_SAFE}-${DOCKER_TAG}.tgz" -C artifacts deploy
          ls -lh artifacts
        '''
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/*', fingerprint: true
      }
    }
  }
}
