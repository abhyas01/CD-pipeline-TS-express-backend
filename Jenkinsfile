pipeline {
    agent any
    // TRIGGER WEBHOOOK
    stages {
        stage('Info') {
            steps {
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Main Branch Steps') {
            when { branch 'main' }
            steps {
                echo "Running MAIN-ONLY stage steps"
                sh 'echo main work here'
            }
        }

        stage('Feature Branch Steps') {
            when {
                not { branch 'main' }
            }
            steps {
                echo "Running FEATURE-ONLY stage steps"
                sh 'echo feature work here'
            }
        }
    }
}