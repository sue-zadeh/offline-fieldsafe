import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
// import Welcompage from '/assets/welcompage2.jpg'

interface HomeProps {
  isSidebarOpen: boolean
}

const Home: React.FC<HomeProps> = ({ isSidebarOpen }) => {
  useEffect(() => {
    AOS.init({ duration: 1200 })
  }, [])

  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        paddingTop: '4rem',
        paddingBottom: 0,
        transition: 'margin 0.3s ease',
        backgroundImage: 'url("/assets/welcompage2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '81vh' }}
      >
        <div
          className="shadow"
          style={{
            width: '22rem',
            backgroundColor: 'rgba(230, 243, 243, 0.85)',
            opacity: '0.75',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center',
            zIndex: '1',
          }}
        >
          <h1
            className="mb-3 fw-bold"
            style={{ color: '#738C40', fontSize: '4rem', wordSpacing: '4px' }}
          >
            Welcome
          </h1>
          <h3 className="mb-0" style={{ color: '#444' }}>
            Nau mai, Haere mai
          </h3>
        </div>
      </div>
    </div>
  )
}

export default Home
