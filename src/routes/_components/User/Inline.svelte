<script>
export let user;
export let bgclass = "has-background-danger-light";

import { userCache, updateCache } from '../../../libs/users';

try {
  updateCache(user);
} catch(e) {
  console.log('warn: Update cache failed', e);
}

$: dn = $userCache[user.email] ? $userCache[user.email].dn : user.email;
$: email = user.email;

</script>

<span class="tag {bgclass}" title="{email}">
    {dn}
</span>
