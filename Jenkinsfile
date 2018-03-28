pipeline {
	environment {
		HTTP_PROXY = credentials('host-http-proxy-url')
		HTTPS_PROXY = credentials('host-https-proxy-url')
		DOCKER_IMAGE = credentials('docker-image-name')
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
            	sh 'npm config set proxy $HTTP_PROXY'
				sh 'npm config set https-proxy $HTTPS_PROXY'
                sh 'npm install' 
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy Staging') {
        	agent { label 'master' }
        	steps {
        		sh 'docker build -t $DOCKER_IMAGE:latest --build-arg http_proxy=$HTTP_PROXY https_proxy=$HTTPS_PROXT .'
        		withCredentials([usernamePassword(credentialsId: 'dockerHub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
          			sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
          			sh 'docker push ${DOCKER_IMAGE}:latest'
        		}
        	}
        }
    }
}