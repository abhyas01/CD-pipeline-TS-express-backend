pipeline {
  agent any

  tools { nodejs 'node-20' }

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

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/*', fingerprint: true
      }
    }
  }
}
