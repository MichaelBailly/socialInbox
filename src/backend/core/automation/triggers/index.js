const titleProcessor = async (email, value) => {
  const back =
    email.email.subject.toLowerCase().indexOf(value.toLowerCase()) >= 0;
  return Promise.resolve(back);
};

const fromProcessor = async (email, value) => {
  return Promise.resolve(
    email.email.from.some(
      (f) =>
        `${f.name || ''} ${f.email || ''}`
          .toLowerCase()
          .indexOf(value.toLowerCase()) >= 0
    )
  );
};

const recipientProcessor = async (email, value) => {
  return Promise.resolve(
    (email.email.to || [])
      .concat(email.email.cc || [])
      .some(
        (f) =>
          `${f.name || ''} ${f.email || ''}`
            .toLowerCase()
            .indexOf(value.toLowerCase()) >= 0
      )
  );
};

export const triggers = {
  title: titleProcessor,
  from: fromProcessor,
  recipient: recipientProcessor,
};
