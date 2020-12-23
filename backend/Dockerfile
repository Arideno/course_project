FROM golang:1.15-alpine
RUN apk add build-base
WORKDIR /go/src/github.com/arideno/course_project
COPY . .
RUN go get -v ./
EXPOSE 8080