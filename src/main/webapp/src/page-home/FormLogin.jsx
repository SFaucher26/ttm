import React,{useState, useContext} from "react";
import CustomInput from "../components/CustomImput.jsx";
import {handleLoginAndAuthenticate} from "../services/userService.js";
import {AuthContext} from "../context/AuthContext.jsx";



const FormLogin = () => {
    const { setAuth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: "",
        password: "",

    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        try {
            // Appelle handleLoginAndAuthenticate pour effectuer les deux étapes : login et récupération des données utilisateur
            const authenticatedUser = await handleLoginAndAuthenticate(formData);

            // Une fois l'utilisateur authentifié, mets à jour le contexte
            setAuth(authenticatedUser); // Met à jour le contexte avec l'utilisateur connecté

            console.log("Login successful:", authenticatedUser);
            alert("Vous êtes bien connecté !");

        } catch (error) {
            console.error("Erreur de connexion :", error);
            alert("Échec de la connexion.");
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <CustomInput
                label="Pseudo"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Entrez votre pseudo"
                required
            />
            <CustomInput
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                required
            />
            <button type="submit">Envoyer</button>
        </form>

    )
}

export default FormLogin;