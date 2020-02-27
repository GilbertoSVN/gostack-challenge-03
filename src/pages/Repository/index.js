import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaArrowRight,
  FaArrowLeft,
  FaLockOpen,
  FaLock,
  FaList,
} from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Selector,
  Navigation,
  Button,
} from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { match } = this.props;
    const { page, state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    if (prevState.page !== page || prevState.state !== state) {
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page,
        },
      });

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        issues: issues.data,
        page,
      });
    }
  }

  handleNext = () => {
    const { page } = this.state;

    this.setState({
      page: page + 1,
    });
  };

  handlePrevious = () => {
    const { page } = this.state;

    if (page > 1) {
      this.setState({
        page: page - 1,
      });
    }
  };

  handleIssueState = state => {
    this.setState({
      state,
    });
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Selector>
          <h1>Por tipo:</h1>
          <div>
            <div>
              <Button onClick={() => this.handleIssueState('closed')}>
                <p>Fechada</p>
                <FaLock color="#7159c1" size={14} />
              </Button>
            </div>
            <div>
              <Button onClick={() => this.handleIssueState('all')}>
                <p>Todas</p>
                <FaList color="#7159c1" size={14} />
              </Button>
            </div>
            <div>
              <Button onClick={() => this.handleIssueState('open')}>
                <p>Abertas</p>
                <FaLockOpen color="#7159c1" size={14} />
              </Button>
            </div>
          </div>
        </Selector>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Navigation>
          <Button onClick={this.handlePrevious}>
            <FaArrowLeft color="#7159c1" size={20} />
          </Button>
          <Button onClick={this.handleNext}>
            <FaArrowRight color="#7159c1" size={20} />
          </Button>
        </Navigation>
      </Container>
    );
  }
}
