import React from 'react'
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import About from '../components/About';
import Card from '../components/Card';
import BottomLoginCard from '../components/BottomLoginCard';
import ThemeButton from '../components/ThemeButton';

function Home() {
    return (
        <>
            <Navbar />
            <Hero/>
            <ThemeButton />
            <About />
            <Card />
            <BottomLoginCard />
            <Footer />
        </>
    )
}

export default Home