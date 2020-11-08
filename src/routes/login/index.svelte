<script context="module">
	export async function preload({ params }, { user }) {
		if (user) {
			this.redirect(302, `/inbox`);
		}
	}
</script>

<script>
	import { goto, stores } from '@sapper/app';
	import { user } from '../../libs/users';
	import ListErrors from '../_components/ListErrors.svelte';
	import { post } from 'utils.js';

	const { session } = stores();

	session.subscribe(value => {
		console.log(value);
	});

	let username = '';
	let password = '';
	let errors = null;

	async function submit() {
		const response = await post('/api/login', { username, password });

		// TODO handle network errors
		errors = response.errors;

		if (response.user) {
			$session.user = response.user;
			$user = response.user;
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Sign in • SoBox</title>
</svelte:head>

<div class="auth-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-xs-center">Sign In</h1>

				<ListErrors {errors}/>

				<form on:submit|preventDefault={submit}>
					<fieldset class="form-group">
						<input class="form-control form-control-lg" type="email" required placeholder="Email" bind:value={username}>
					</fieldset>
					<fieldset class="form-group">
						<input class="form-control form-control-lg" type="password" required placeholder="Password" bind:value={password}>
					</fieldset>
					<button class="btn btn-lg btn-primary pull-xs-right" type="submit">
						Sign in
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
