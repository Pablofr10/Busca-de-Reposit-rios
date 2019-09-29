import React, { useState, useCallback, useEffect } from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import { Container, Form, SubmitButton, List, DeleteButton } from './styles';
import { Link } from 'react-router-dom';

import api from '../../services/api'

export default function Main() {

    const [newRepo, setNewRepo] = useState('');
    const [repositorios, setRepositorios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    //DidMount
    useEffect(()=>{
        const repoStorage = localStorage.getItem('repos');

        if (repoStorage) {
            setRepositorios(JSON.parse(repoStorage));
        }

    }, []);

    //DidUpdate
    useEffect(()=>{
        localStorage.setItem('repos', JSON.stringify(repositorios));
    }, [repositorios]);


    const enviarPesquisa = useCallback((e) => {
        // para não da refresh quando clicar
        e.preventDefault();

        async function submit() {
            setLoading(true);
            setAlert(null);
            try {

                if(newRepo === ''){
                    throw new Error('Você precisa indicar um repositório')
                }

                const response = await api.get(`repos/${newRepo}`);

                const hasRepo = repositorios.find(repo => repo.name === newRepo);

                if (hasRepo) {
                    throw new Error('Repositório Duplicado');
                }

                const data = {
                    name: response.data.full_name,
                }

                console.log(data);
                setRepositorios([...repositorios, data]);
                setNewRepo('');
            } catch (error) {
                setAlert(true);
                console.log(error);
            } finally {
                setLoading(false);
            }

        }

        submit();
    }, [newRepo, repositorios]);

    function mudarInput(e) {
        setNewRepo(e.target.value);
        setAlert(null);
    }


    const handleDelete = useCallback(
        (repo) => {
            const find = repositorios.filter(r => r.name !== repo);
            setRepositorios(find);
        },
        [repositorios],
    )

    return (
        <Container>

            <h1>
                <FaGithub size={25} />
                Meus Repositórios
            </h1>

            <Form onSubmit={enviarPesquisa} error={alert}>
                <input type="text"
                    placeholder="Adicionar Repositórios"
                    value={newRepo}
                    onChange={mudarInput}
                />

                <SubmitButton Loading={loading ? 1 : 0}>
                    {
                        loading ? (
                            <FaSpinner color="#FFF" size={14} />
                        ) : (
                                <FaPlus color="#FFF" size={14} />
                            )
                    }
                </SubmitButton>
            </Form>

            <List>
                {repositorios.map(repo => (
                    <li key={repo.name}>
                        <span>
                            <DeleteButton onClick={()=>handleDelete(repo.name)}>
                                <FaTrash size={14}/>
                            </DeleteButton>
                            {repo.name}</span>
                        <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                            <FaBars size={20} />
                        </Link>
                    </li>
                ))}
            </List>

        </Container>
    )
}
