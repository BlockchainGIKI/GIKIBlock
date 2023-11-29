import React from 'react';
import CustomButton from './Components/Custom-Button/Custom-button.component';
import Header from './Components/Header/Header.component';
import MainDashboard from './Components/Main-Dashboard/Main-dashboard.component';
import DynamicTable from './Components/DynamicTable/DynamicTable.component';
import TextArea from './Components/Text-Area/Text-Area.component';
import store from './store';
import { Provider } from 'react-redux';
import './App.css';
// import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './Components/Navigation/Navbar';
import Goats from './Components/Instructions/Instructions';


function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Header></Header>
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<MainDashboard />} />
            <Route path='/instructions' element={<Goats />} />
          </Routes>
        </Router>
        <MainDashboard></MainDashboard>
        <CustomButton>Connect wallet (Metamask)</CustomButton>
        <TextArea></TextArea>
        <DynamicTable></DynamicTable>
      </div>
    </Provider>
  );
}

export default App;
