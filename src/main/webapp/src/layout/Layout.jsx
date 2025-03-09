import React, {useContext, useState, useEffect, useRef} from "react";
import {Outlet, Link} from "react-router-dom";
import "./layout.css";
import logo from "../assets/images/logo.webp";
import ttm_rose from "../assets/images/ttm_rose.webp";
import hologramme_ttm from "../assets/images/hologramme_ttm.webp";
import { AuthContext } from "../context/AuthContext.jsx";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faHouse, faMessage, faAddressCard, faToolbox, faUser } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTiktok, faSquareFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {LogoutLi} from "./LogoutLi.jsx";

export default function Layout() {
    const {auth } = useContext(AuthContext);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProfilOpen, setIsProfilOpen] = useState(false);
    const profilRef = useRef(null);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen)
    };
    const toggleProfil = () => {
        setIsProfilOpen((prevState) => !prevState);
    };

    // Gestion des clics à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profilRef.current && !profilRef.current.contains(event.target)) {
                setIsProfilOpen(false); // Ferme le menu si clic à l'extérieur
            }
        };

        if (isProfilOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Nettoyage des écouteurs d'événements au démontage
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfilOpen]); // Réexécute quand isProfilOpen change

    return (
        <>
        <header>
        <Link to="/"><img src={logo} alt="logo-initiative-deux-sèvres" className="logo-entreprise"/></Link>
        <Link to="/"><div className="div-logo-ttm"><img src={ttm_rose} alt="logo-ttm" className="logo-ttm"/></div></Link>
            <nav className ={`navbar ${isNavOpen ? 'active' : ''}`}>
            <div className="burger-icon" onClick={toggleNav}>
             {isNavOpen ? '\u2716' : '\u2630' }
            </div>
            
                <ul className={`nav-links ${isNavOpen ? 'open' : ''}`}>
                    
                    <li>
                        <Link to="/"><FontAwesomeIcon icon={faHouse} className="icon"/><div className="page-name">Accueil</div></Link>
                    </li>
                    <li>
                        <Link to="/Profils"><FontAwesomeIcon icon={faAddressCard} className="icon"/><div className="page-name">Profils</div></Link>
                    </li>
                    <li>
                        <Link to="/Messagerie"><FontAwesomeIcon icon={faMessage} className="icon"/><div className="page-name">Messagerie</div></Link>
                    </li>
                    <li>
                        <Link to="/boite-a-outils"><FontAwesomeIcon icon={faToolbox} className="icon"/><div className="page-name">Boîte à Outils</div></Link>
                    </li>
                </ul>
                <div className="profil" ref={profilRef}>
                    <div className="icon-user" onClick={toggleProfil} id="profil">
                        <FontAwesomeIcon icon={faUser}/>
                        <div className="current">
                        {auth && <span>{auth.username}</span> }
                        </div>
                    </div>
                    {isProfilOpen && (
                        <div className="menu" aria-label="Sous menu du profil">
                            <ul className="dropdown-content">
                                <li>
                                    <Link to="/AdminView" className="menu-link" aria-label="Lien d'administrateur">Back-office</Link>
                                </li>
                                <li>
                                    <Link to="/userProfil" className="menu-link" aria-label="Lien vers le profil utilisateur">Mon profil</Link>
                                </li>
                                <li aria-label="Lien pour la déconnection">
                                    <LogoutLi/>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>
        </header>
            <main>
                <Outlet/>
            </main>
            <footer className="footer-line">
                <div className="footer-bloc1">
                    <img src={hologramme_ttm} alt="logo d'initiative Deux-Sèvres" width="50" height="50"/>
                </div>
                <div className="footer-bloc2" aria-label="Informations sur Initiative Deux-Sèvres">
                    <p className="text-bloc2">Votre plateforme : <br/>Initiative Deux-Sèvres</p>
                </div>
                <div className="footer-bloc3" aria-label="Coordonnées de contact">
                    <p><a href="tel:+0679875609">0679875609</a><br/><a href="mailto:accompagnement@initiativedeuxsevres.fr" >accompagnement@initiativedeuxsevres.fr</a></p>
                </div>
                <div className="footer-bloc4" aria-label="Liens vers les réseaux sociaux">
                    <Link to="" className="social-link" target="_blank"><FontAwesomeIcon icon={faInstagram} className="social-icon" aria-label="Instagram"/></Link>
                    <Link to="" className="social-link" target="_blank"><FontAwesomeIcon icon={faTiktok} className="social-icon" aria-label="TikTok"/></Link>
                    <Link to="https://www.facebook.com/profile.php?id=61556616180678" className="social-link" target="_blank"><FontAwesomeIcon icon={faSquareFacebook} className="social-icon" aria-label="Facebook"/></Link>
                    <Link to="https://www.linkedin.com/company/initiative-deux-sevres/posts/?feedView=all" className="social-link" target="_blank"><FontAwesomeIcon icon={faLinkedin} className="social-icon" aria-label="Linkedin"/></Link>
                </div>
            </footer>
        </>
    );
}