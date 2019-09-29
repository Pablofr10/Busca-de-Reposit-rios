import React, {useState, useEffect} from 'react';
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList } from './styles';
import { FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api';

//decodeURIComponent(match.params.repositorio)

export default function Repositorio({match}) {

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [estado, setEstado] = useState([
        {state: 'all', label: 'Todas', active: true },
        {state: 'open', label: 'Abertas', active: true },
        {state: 'closed', label: 'Fechadas', active: true },
    ]);
    const [filterIndex, setFilterIndex] = useState(0);

    console.log(estado);

    useEffect(() => {

        async function load(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`,{
                    params:{
                        state: estado.find(f => f.active).state,
                        per_page: 5,
                    }
                })
            ]);

            setRepositorio(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);
        };

        load();
    }, [match.params.repositorio]);

    useEffect(() => {
        
        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params:{
                    state: estado[filterIndex].state,
                    page,
                    per_page: 5,
                },
            });
            
            setIssues(response.data);
        }

        loadIssue();

    }, [estado, filterIndex, match.params.repositorio, page]);

    function handlePage(action) {
        setPage(action === 'back' ? page - 1 : page + 1)
    }

    function handleFilter(index){
        setFilterIndex(index);
    }

        if (loading) {
            return(
                <Loading>
                    <h1>Carregando...</h1>
                </Loading>
            )
        } else {
            
        }

        return (
            <Container>
                <BackButton to="/">
                    <FaArrowLeft color="#000" size={30}/>
                </BackButton>
                <Owner>
                    <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login}/>
                    <h1>{repositorio.name}</h1>
                    <p>{repositorio.description}</p>
                </Owner>

                <FilterList active={filterIndex}>
                    {estado.map((e, index) =>(
                        <button type="button" key={e.label}
                         onClick={()=>handleFilter(index)}>
                             {e.label}
                         </button>
                    ))}

                </FilterList>

                <IssuesList>
                    {issues.map(issue =>(
                        <li key={String(issue.id)}>
                            <img src={issue.user.avatar_url} alt={issue.user.login}/>

                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>

                                    {issue.labels.map(label =>(
                                        <span key={String(label.id)}>{label.name}</span>
                                        ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssuesList>

                <PageActions>
                    <button type="button" onClick={()=>handlePage('back')} disabled={page < 2}>Voltar</button>

                    <button type="button" onClick={()=>handlePage('next')}>Próxima</button>
                </PageActions>
            </Container>
        )
}

