pipeline {
    agent any

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
                echo "${VERSION}" | tee artifacts/VERSION.txt

                echo "VERSION=${VERSION}" > artifacts/version.env
                echo "BRANCH_SAFE=${BRANCH_SAFE}" >> artifacts/version.env
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                set -eu
                source artifacts/version.env

                docker build -t "todo-web:${VERSION}" ./backend
                docker build -t "todo-nginx:${VERSION}" ./nginx
                '''
            }
        }

        stage('Package Artifacts') {
            steps {
                sh '''
                set -eu
                source artifacts/version.env

                docker save "todo-web:${VERSION}" | gzip > "artifacts/todo-web-${BRANCH_SAFE}-${VERSION}.tar.gz"
                docker save "todo-nginx:${VERSION}" | gzip > "artifacts/todo-nginx-${BRANCH_SAFE}-${VERSION}.tar.gz"

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
