import { Helmet } from 'react-helmet-async';
import Hero from '../../components/Hero/Hero';
import Statistics from '../../components/Statistics/Statistics';
import HowWeHelp from '../../components/HowWeHelp/HowWeHelp';
import RoadSigns from '../../components/RoadSigns/RoadSigns';
import Pricing from '../../components/Pricing/Pricing';
import Testimonials from '../../components/Testimonials/Testimonials';

function Home() {
  return (
    <>
      <Helmet>
        <title>Road Rules Academy - Master Road Signs & Pass Your Driving Exam</title>
      </Helmet>
      <Hero />
      <Statistics />
      <HowWeHelp />
      <RoadSigns />
      <Pricing />
      <Testimonials />
    </>
  );
}

export default Home;
