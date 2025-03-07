import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">

            <SignIn redirectUrl="/user-dashboard" />
        </div>
    );
};

export default SignInPage;
