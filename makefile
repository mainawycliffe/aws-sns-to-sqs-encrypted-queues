build:
	set GOOS=linux 
	go build -o goOut/sendWelcomeEmail ./src/sendWelcomeEmail/sendWelcomeEmail.go
	go build -o goOut/newUser ./src/newUser/newUser.go
	tsc