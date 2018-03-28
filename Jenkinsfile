pipeline {
    agent {
        docker {
            image 'jauhararifin/salman-activity-backend' 
            args '-p 3000:3000 -u root:root'
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install' 
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}

