import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';


const faqs = [
  { id: '1', question: 'How do I make a donation?', answer: 'You can make a donation by selecting a charity from the list and entering your payment details on the secure payment page.' },
  { id: '2', question: 'Is my donation tax-deductible?', answer: 'Yes, all donations made through our platform are tax-deductible. However, please consult with a tax advisor to ensure you have the proper documentation.' },
  { id: '3', question: 'How can I volunteer?', answer: 'Visit our Volunteer section and choose a project or event that aligns with your interests. You can sign up directly through our app.' },
  { id: '4', question: 'Can I cancel a recurring donation?', answer: 'Yes, you can manage and cancel recurring donations at any time from your account settings or by contacting customer support.' },
  { id: '5', question: 'Who do I contact if I have issues?', answer: 'Our support team is ready to help you! Please contact us through the app’s Help Center or email us directly at support@gively.com for assistance.' },
  { id: '6', question: 'Where can I view my donation history?', answer: 'Your entire donation history is available under the "Donation History" section in your account profile.' },
  { id: '7', question: 'How do I update my payment information?', answer: 'Go to "Account Settings" and select "Payment Methods" to update or add new payment information securely.' },
  { id: '8', question: 'What is the minimum donation amount?', answer: 'The minimum donation amount is $1. This helps ensure that even small donations can make a big impact.' },
  { id: '9', question: 'How are the charities vetted?', answer: 'All charities on our platform undergo a rigorous evaluation process to ensure they are reputable and have a track record of effective, impactful work.' },
  { id: '10', question: 'Can I donate anonymously?', answer: 'Yes, you have the option to donate anonymously. During the donation process, simply check the box marked "Donate Anonymously".' },
  { id: '11', question: 'Does Gively share my personal information?', answer: 'We value your privacy. Gively does not share your personal information with any third parties without your explicit consent.' },
  { id: '12', question: 'How do I unsubscribe from emails?', answer: 'You can unsubscribe from our emails by clicking the "unsubscribe" link at the bottom of any email we send.' },
];
const FAQScreen = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.header, { fontFamily: 'Montserrat-Bold' }]}>Frequently Asked Questions</Text>
      {faqs.map(faq => (
        <View key={faq.id} style={styles.faqItem}>
          <TouchableOpacity onPress={() => toggleExpand(faq.id)}>
            <Text style={[styles.question, { fontFamily: 'Montserrat-Medium' }]}>{faq.question}</Text>
          </TouchableOpacity>
          {expandedId === faq.id && (
            <Text style={[styles.answer, { fontFamily: 'Montserrat-Medium' }]}>{faq.answer}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  answer: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default FAQScreen;
