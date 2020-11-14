export function intersect(node, observer) {
  observer && observer.observe(node);

  return {
    destroy() {
      observer && observer.unobserve(node);
    },
  };
}
