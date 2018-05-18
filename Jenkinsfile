pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/danhakin/spring-petclinic-angular.git', credentialsId: 'github-danhakin', branch: 'master'            
            }
        }
        stage('Build image') {
            steps {
                script {
                    app = docker.build("spring-petclinic-front:${env.BUILD_ID}")
                }
            }
        }
        stage('Unit Testing') {
            steps {
                script {
                    app.inside {
                        sh "npm install"
                    }
                }
            }
        }
        stage('API Testing')
            steps {
                script {
                    app.inside {
                        sh "npm run apiTest"
                    }
                }
            }
        }
        stage('Deliver') {
            steps{
                sh 'echo delivering coming soon...'
            }
        }
    }
}