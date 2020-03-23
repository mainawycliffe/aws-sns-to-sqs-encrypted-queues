package users

type User struct {
	Email    string `json:"email" faker:"email"`
	FullName string `json:"name" faker:"name"`
	Phone    string `json:"phone" faker:"e_164_phone_number"`
}
