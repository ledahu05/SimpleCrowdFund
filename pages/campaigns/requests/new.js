import React, {Component} from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import Campaign from '../../../ethereum/campaign';
import web3 from '../../../ethereum/web3';
import { Router, Link } from '../../../routes';
import  Layout  from '../../../components/Layout';


class RequestNew extends Component {
    state = {
        description: '',
        value:'',
        recipient: '',
        errorMessage: '',
        loading: false
    };
    
    static async getInitialProps (props) {
        const { address } = props.query;
        return { address };
    }



    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({loading: true, errorMessage: ''});
        const campaign = Campaign(this.props.address);
        try {
            const accounts = await web3.eth.getAccounts();
            await campaign.methods
            .createRequest(this.state.description, web3.utils.toWei(this.state.value, 'ether'), this.state.recipient)
            .send({
                from: accounts[0]
            });
            Router.pushRoute(`/campaigns/${this.props.address}/requests`);
        } catch(err) {
            this.setState({ errorMessage: err.message});
        }

        this.setState({loading: false});
    };

    render() {
        return (
            <Layout>
                <Link route={`/campaigns/${this.props.address}/requests`}>
                    <a>
                       Back
                    </a>
                </Link>
                <h3>Create a request</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Description</label>
                        <Input 
                            value={this.state.description}
                            onChange={event => this.setState({description: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Amount in Ether</label>
                        <Input 
                            label='ether' 
                            labelPosition='right'
                            value={this.state.value}
                            onChange={event => this.setState({value: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Recipient</label>
                        <Input 
                            value={this.state.recipient}
                            onChange={event => this.setState({recipient: event.target.value})}
                        />
                    </Form.Field>
                    <Message
                        error
                        header='There was some errors with your submission'
                        content={this.state.errorMessage}
                    />
                    <Button primary loading={this.state.loading} type='submit'>Create!</Button>
                </Form>
            </Layout>
        );
    }
    
}

export default RequestNew;