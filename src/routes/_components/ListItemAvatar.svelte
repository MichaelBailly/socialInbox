<script>
// /api/avatars?email=jmaria@bintelligence.com&objectType=email&displayName=Maria - BIG Innovation Awards&size=65

// resource.email
// resource.name
export let resource;
export let size;

const host = new URL(window.location).origin;

let avatarUrl;

$: if (resource.email) {
  const displayName = resource.name || resource.email;
  const avatarSize = size || 64;
  const url = new URL('/api/avatar', host);
  url.searchParams.append('email', resource.email);
  url.searchParams.append('name', displayName);
  url.searchParams.append('size', size);
  avatarUrl = url.toString();
} else {
  avatarUrl = '/foo';
}

</script>

<img src="{avatarUrl}" alt="Avatar">

<style lang="less">
img {
  width: 40px;
}
</style>
