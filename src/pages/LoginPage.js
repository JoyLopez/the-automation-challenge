class LoginPage {
    constructor(page) {
        this.page = page;

        // Main button that opens the authentication modal
        this.signUpOrLoginButton = page.getByRole('button', {
            name: 'SIGN UP OR LOGIN'
        });

        // Sign Up modal
        this.firstName = page.getByRole('textbox', {
            name: 'First Name'
        });

        this.lastName = page.getByRole('textbox', {
            name: 'Last Name'
        });

        this.email = page.getByRole('textbox', {
            name: 'Email'
        });

        this.password = page.getByRole('textbox', {
            name: 'Password'
        });

        this.signUpButton = page.getByRole('button', {
            name: 'SIGN UP',
            exact: true
        });

        // Switch from Sign Up to Login
        this.orLoginButton = page.getByRole('button', {
            name: 'OR LOGIN',
            exact: true
        });

        // Login form
        this.rememberMe = page.getByRole('checkbox', {
            name: 'Remember me'
        });

        this.loginButton = page.getByRole('button', {
            name: 'LOG IN'
        });

        this.resetPasswordButton = page.getByRole('button', {
            name: 'RESET PASSWORD'
        });
    }

    /**
     * Open the authentication modal.
     */
    async openAuthenticationModal() {
        await this.signUpOrLoginButton.click();
    }

    /**
     * Switch from the Sign Up form to Login.
     */
    async switchToLogin() {
        await this.orLoginButton.click();
    }

    /**
     * Log in using the provided credentials.
     */
    async login(email, password) {
        await this.email.fill(email);
        await this.password.fill(password);

        await this.loginButton.click();
    }
}

module.exports = {
    LoginPage
};