'use client';

import { Select, Form } from 'antd';

const BrokerAgent = (property) => {
  let options = property.options;
  if (typeof property.options === 'string') {
    try {
      options = eval(property.options);
    } catch (error) {
      options = [];
      console.error('Error parsing options', error);
    }
  }
  return (
    <Form.Item label={property?.label} name={property.name} rules={property.rules}>
      <Select
        defaultValue={property.defaultValue}
        style={property.style}
        onChange={property.handleChange}
        options={options}
      />
    </Form.Item>
  );
};

export default BrokerAgent;
