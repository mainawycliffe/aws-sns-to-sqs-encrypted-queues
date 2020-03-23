build:
	set GOOS=linux 
	go build -o src/sendWelcomeEmail/sendWelcomeEmail ./src/sendWelcomeEmail/sendWelcomeEmail.go
	go build -o src/newUser/newUser ./src/newUser/newUser.go
	tsc