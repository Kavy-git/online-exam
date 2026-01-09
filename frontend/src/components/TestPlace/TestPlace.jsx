import React from 'react'
import './TestPlace.css'
import { test_list } from '../../assets/assets'

const TestPlace = ({category,setCategory}) => {
  return (
    <div className='explore-menu'  id='explore-menu'>
      <h1>Using ZOnline is Easy and Understandable:</h1>
      <p className='explore-menu-text'>This application has very easy understanding features and it is easy to use. Here are few steps:</p>
      <div className="explore-menu-list">
        {test_list.map((item,index)=>{
          return(
            <div onClick={()=>setCategory(prev=>prev===item.list_name?"All":item.list_name)}key={index}className='explore-menu-list-item'>
              <img className={category===item.list_name?"active":""}src={item.list_image} alt="" />
              <p>{item.list_name}</p>
            </div>
          )
        })}
      </div>
      <hr/>
    </div>
  )
}

export default TestPlace
