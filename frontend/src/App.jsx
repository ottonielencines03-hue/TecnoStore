import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

/* Pages */
import Landing from './pages/Landing';
import Login from './pages/Login';
import PantallaInicio from './pages/PantallaInicio';
import PanelProveedor from './pages/PanelProveedor';
import PerfilProveedor from './pages/PerfilProveedor';
import Productos from './pages/Productos';
import GestionarProductos from './pages/GestionarProductos';

/* Components */
import CartModal from './components/CartModal';

/* Context */
import { CartProvider } from './context/CartContext';


setupIonicReact({
  mode: 'md',
});

const App = () => {
  return (
    <IonApp>
      <CartProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/PantallaInicio" component={PantallaInicio} />
            <Route exact path="/proveedor" component={PanelProveedor} />
            <Route exact path="/perfil-proveedor" component={PerfilProveedor} />
            <Route exact path="/productos" component={Productos} />
            <Route exact path="/gestionar-productos" component={GestionarProductos} />
            <Redirect to="/" />
          </IonRouterOutlet>
          <CartModal />
        </IonReactRouter>
      </CartProvider>
    </IonApp>
  );
};

export default App;
