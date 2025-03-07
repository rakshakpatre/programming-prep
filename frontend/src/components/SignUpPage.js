import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">
            <SignUp redirectUrl="/sign-in" />
        </div>
    );
};

export default SignUpPage;
