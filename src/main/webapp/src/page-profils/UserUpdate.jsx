import {useContext, useState, useEffect} from "react";
import CustomInput from "../components/CustomImput.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { UpdateUser} from "../services/userService.js";
import { useNotification } from '../context/NotificationContext.jsx';

export default function UserUpdate() {
    const { notifySuccess, notifyError } = useNotification();
    const { auth, setAuth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        //si le contexte est chargé, affiche les données sinon la valeur est null
        id: auth?.id || "",
        username: auth?.username || "",
        email: auth?.email || "",
        password: auth?.password || "",
    });

    useEffect(() => {
        if (auth) {
            setFormData({
                id: auth.id || "",
                username: auth.username || "",
                email: auth.email || "",
                password: auth.password || "",
            });
        }
    }, [auth]);


// Gestion générique des champs d'entrée
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    try {
        const response = await UpdateUser(formData);
        console.log("Mise à jour réussie:", response);
        setAuth({
            ...auth,
            username: formData.username,
            email: formData.email,
        });
        notifySuccess("Utilisateur mis à jour avec succès !");
    } catch (error) {
        console.error("Erreur lors de la mise à  jour :", error.message || error);
        notifyError(`Échec de la mise à jour : ${error.message || "Erreur inconnue."}`);
    }
};

return (
    <form onSubmit={handleSubmit}>
        <CustomInput
            label="Pseudo"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange} // Mise à jour générique via `handleChange`
            placeholder="Entrez votre pseudo"
            required
        />
        <CustomInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email"
            required
        />
        <button type="submit">Modifier</button>
    </form>
);
}