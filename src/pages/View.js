import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './View.css';
const View = () => {
    const [user, setUser] = useState(null);
    const { id } = useParams();
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/get/${id}`)
            .then((resp) => {
            const fetchedUser = resp.data[0];
            setUser(fetchedUser);
        })
            .catch((error) => {
            console.error('Error fetching user:', error);
        });
    }, [id]);
    if (!user)
        return _jsx("p", { children: "Loading..." });
    return (_jsx("div", { style: { marginTop: '150px' }, children: _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("p", { children: "User Contact Details" }) }), _jsxs("div", { className: "container", children: [' ', _jsx("strong", { children: "ID: " }), _jsx("span", { children: id }), _jsx("br", {}), _jsx("br", {}), _jsx("strong", { children: "Name: " }), _jsx("span", { children: user.name }), _jsx("br", {}), _jsx("br", {}), _jsx("strong", { children: "Email: " }), _jsx("span", { children: user.email }), _jsx("br", {}), _jsx("br", {}), _jsx("strong", { children: "Contact: " }), _jsx("span", { children: user.contact }), _jsx("br", {}), _jsx("br", {}), _jsx(Link, { to: "/", children: _jsx("button", { className: "btn btn-edit", children: "Go Back" }) })] })] }) }));
};
export default View;
