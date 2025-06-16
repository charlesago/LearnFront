import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./editProfile.css";

const EditProfile: React.FC = () => {
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        username: "",
        birth_date: "",
        gender: "",
        avatar: "",
    });

    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        fetch("http://127.0.0.1:8000/api/profile/", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setProfile({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    username: data.username || "",
                    birth_date: data.birth_date || "",
                    gender: data.gender || "",
                    avatar: data.avatar || "https://via.placeholder.com/150",
                });
            })
            .catch((err) => console.error("Erreur récupération du profil :", err));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewAvatar(e.target.files[0]);
            setProfile({ ...profile, avatar: URL.createObjectURL(e.target.files[0]) });
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("first_name", profile.first_name);
        formData.append("last_name", profile.last_name);
        formData.append("username", profile.username);
        formData.append("birth_date", profile.birth_date);
        formData.append("gender", profile.gender);
        if (newAvatar) formData.append("avatar", newAvatar);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/profile/", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                navigate("/profil");
            } else {
                console.error("Erreur lors de la mise à jour du profil");
            }
        } catch (error) {
            console.error("Erreur :", error);
        }
    };

    return (
        <div className="edit-profile-container">
            <Sidebar />
            <div className="edit-profile-content">
                <h2 className="title">Modifier le profil</h2>
                <div className="profile-avatar-section">
                    <img src="https://learnia.charlesagostinelli.com/${profile.avatar}" alt="Avatar" className="profile-avatar" />
                    <label htmlFor="avatar-upload" className="change-avatar">
                        Changer la photo de profil
                    </label>
                    <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} hidden />
                </div>
                <div className="profile-fields">
                    <label>Nom</label>
                    <input type="text" name="last_name" value={profile.last_name} onChange={handleInputChange} />
                    <label>Prénom</label>
                    <input type="text" name="first_name" value={profile.first_name} onChange={handleInputChange} />
                    <label>Nom d’utilisateur</label>
                    <input type="text" name="username" value={profile.username} onChange={handleInputChange} />
                    <label>Date de Naissance</label>
                    <input type="date" name="birth_date" value={profile.birth_date} onChange={handleInputChange} />
                    <label>Genre</label>
                    <select name="gender" value={profile.gender} onChange={handleInputChange}>
                        <option value="">Sélectionner...</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Autre">Non genré</option>
                    </select>

                </div>
                <button className="save-button" onClick={handleSave}>Enregistrer</button>
            </div>
        </div>
    );
};

export default EditProfile;
