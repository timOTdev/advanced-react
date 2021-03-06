import Form from './styles/Form'
import useForm from '../lib/useForm'
import { gql, useMutation } from '@apollo/client';
import { CURRENT_USER_QUERY } from './User';
import DisplayError from "./DisplayError";

const SIGNIN_MUTATION = gql`
	mutation SIGNIN_MUTATION($email: String!, $password: String!) {
		authenticateUserWithPassword(email: $email, password: $password) {
			... on UserAuthenticationWithPasswordSuccess {
				item {
					id
					email
					name
				}
			}
			... on UserAuthenticationWithPasswordFailure {
				code
				message
			}
		}
	}
`;

export default function SignIn() {
  const { inputs, handleChange, resetForm } = useForm({
    email: '',
    password: '',
  })
  const [signin, { data, loading }] = useMutation(SIGNIN_MUTATION, {
    variables: inputs,
    // refetch the currently logged in user
    refetchQueries: [{ query: CURRENT_USER_QUERY }]
  })

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(inputs);
    const res = await signin();
    console.log(res);
    resetForm();
  }

  const error =
		data?.authenticateUserWithPassword.__typename ===
		"authenticateUserWithPasswordFailure" ? 
      data?.authenticateUserWithPassword : undefined;
  return (
		<Form method="POST" onSubmit={handleSubmit}>
			<h2>Sign into your account</h2>
			<DisplayError error={error} />
			<fieldset>
				<label htmlFor="email">
					Email
					<input
						type="email"
						name="email"
						placeholder="Your email address"
						autoComplete="email"
						value={inputs.email}
						onChange={handleChange}
					/>
				</label>
				<label htmlFor="password">
					Password
					<input
						type="password"
						name="password"
						placeholder="Your password"
						autoComplete="password"
						value={inputs.password}
						onChange={handleChange}
					/>
				</label>
				<button type="submit">Sign In</button>
			</fieldset>
		</Form>
	);
}
