# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Case Engine — delil / şüpheli bağlantı dengesi

- **case-001 … case-007:** Öğretici / orta. `relatedSuspectIds` daha net olabilir; sorun değil.
- **case-008+:** Bariz olmasın. Aynı şüpheli, delillerin çoğunun “bağlantılı kişiler” listesinde tek başına öne çıkmasın.
  - Örnek: 4 delilde en fazla **2** delil aynı kişiyi göstersin (3/4 yasak).
  - Masum şüphelilere de bağlantı ver; red herring kullan.
  - Gerçek suçlu hâlâ çelişki + çözüm delilleriyle yakalanabilsin; sadece UI ipucu dağıtılsın.
