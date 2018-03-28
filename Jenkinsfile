pipeline {
	environment {
		HOST_HTTP_PROXY_URL = credentials('host-http-proxy-url')
		HOST_HTTPS_PROXY_URL = credentials('host-https-proxy-url')
	}
    agent {
        docker {
            image 'node:8-alpine' 
            args '-p 3000:3000 -u root:root'
        }
    }
    stages {
        stage('Build') { 
            steps {
            	sh 'npm config set proxy $HOST_HTTP_PROXY_URL'
				sh 'npm config set https-proxy $HOST_HTTPS_PROXY_URL'
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

