A: Build Eiffel-ViCi Docker image based on Eiffel-ViCi from an Artifactory, e.g. Jitpack:
cd (git root dir)
docker build -t eiffel-intelligence:0.0.19 --build-arg URL=https://jitpack.io/com/github/eiffel-community/eiffel-vici/0.0.1/eiffel-vici-0.0.1.war -f src/main/docker/Dockerfile .



B: Build Eiffel-ViCi based on local Eiffel-ViCi source code changes
1. Build Eiffel-ViCi service artifact war file:
cd (git root dir)
mvn package -DskipTests

2. Build Eiffel-ViCi Docker image:
cd (git root dir)/
docker build -t eiffel-vici:0.0.1 --build-arg URL=./target/eiffel-vici-0.0.1.war -f src/main/docker/Dockerfile .
