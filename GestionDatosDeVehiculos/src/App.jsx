import './App.css';
import Bienvenida from './component/Bienvenida';
import DatosVehiculo from './component/DatosVehiculo';
import AlertasRecalls from './component/AlertasRecalls';
import Danhos from './component/Danhos';
import Emisiones from './component/Emisiones';
import Kilometraje from './component/Kilometraje';
import RevisionTecnica from './component/RevisionTecnica';
import Seguridad from './component/Seguridad';
import UsoComercial from './component/UsoComercial';
import ValorMercado from './component/ValorMercado';
import Menu from './component/Menu';
import { Route, Routes } from 'react-router-dom';



function App() {

    const menus = [
    { nombre: "Bienvenidos", link: "/" },
    { nombre: "Alerta", link: "/alertasrecalls" },
    { nombre: "Danhos", link: "/danhos" },
    { nombre: "Datos", link: "/datosvehiculos"},
    { nombre: "Emisiones", link: "/emisiones"},
    { nombre: "Kilometraje", link: "/kilometraje"},
    { nombre: "Revision", link: "/revisionTecnica"},
    { nombre: "Seguridad", link: "/seguridad"},
    { nombre: "Comercial", link: "/usocomercial"},
    { nombre: "Valor", link: "/valormercado"},
  ];

  

  return (
    <>
     <Menu menu={menus} />
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/alertasrecalls" element={<AlertasRecalls/>} />
        <Route path="/danhos" element={<Danhos/>} />
        <Route path="/datosvehiculos" element={<DatosVehiculo/>} />
        <Route path="/emisiones" element={<Emisiones/>} />
        <Route path="/kilometraje" element={<Kilometraje/>}/>
        <Route path="/revisionTecnica" element={<RevisionTecnica/>}/>
        <Route path="/seguridad" element={<Seguridad/>}/>
        <Route path="/usocomercial" element={<UsoComercial/>}/>
        <Route path="/valormercado" element={<ValorMercado/>}/>
      </Routes>
    </>
  )
}

export default App
