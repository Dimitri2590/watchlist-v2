import React, { useState } from 'react';
import AddFilmForm from '../components/AddFilmForm';
import FilmList from '../components/FilmList';

const Home = () => {
    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => {
        setRefresh(prev => prev + 1);
    };

    return (
        <div className="space-y-12">
            <section>
                <AddFilmForm onAdd={handleRefresh} />
            </section>

            <section>
                <FilmList refresh={refresh} />
            </section>
        </div>
    );
};

export default Home;
