import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import TestPlace from '../../components/TestPlace/TestPlace'
import { motion } from "framer-motion";


const Home = ({setShowLogin}) => {

  const [category,setCategory] = useState("All");
  return ( <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div>
      <Header setShowLogin={setShowLogin}/>
      <TestPlace category={category} setCategory={setCategory}/>
      
      
    </div>
    </motion.div>
  )
}

export default Home
