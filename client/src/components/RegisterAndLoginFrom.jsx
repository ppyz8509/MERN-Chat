import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

const RegisterAndLoginFrom = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
    const [errorMessage, setErrorMessage] = useState("");
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLoginOrRegister === "register" ? "register" : "login";
            const { data } = await axios.post(url, { username, password });
            setLoggedInUsername(username);
            setId(data.id);
        } catch (error) {
            setErrorMessage("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-blue-50">
            <form onSubmit={handleSubmit} className="w-96 mx-auto bg-white p-8 rounded-md shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </h2>

                {errorMessage && (
                    <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
                )}

                <input
                    type="text"
                    value={username}
                    className="block w-full rounded-sm p-3 mb-3 border"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    value={password}
                    className="block w-full rounded-sm p-3 mb-3 border"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="bg-blue-500 text-white block w-full rounded-sm p-3">
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </button>

                <div className="text-center mt-4">
                    {isLoginOrRegister === "register" && (
                        <div>
                            Already a member?{" "}
                            <button
                                className="ml-1 text-blue-500"
                                onClick={() => {
                                    setIsLoginOrRegister("login");
                                    setErrorMessage("");
                                }}
                            >
                                Login
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === "login" && (
                        <div>
                            Don't have an account?{" "}
                            <button
                                className="ml-1 text-blue-500"
                                onClick={() => {
                                    setIsLoginOrRegister("register");
                                    setErrorMessage("");
                                }}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RegisterAndLoginFrom;
